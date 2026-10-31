#!/usr/bin/env python3
"""Post-deploy cleanup for explicitly scoped Firebase credentials; never reads values.
Keep the newest version and every version referenced by deployed workloads.
Abort rather than destroy when an old version is still referenced. Rollbacks to
old revisions may require redeployment with the current credential afterward.
"""
import argparse,json,subprocess,sys
SCOPES={
 'teemavenue-e5fb6':('us-central1',{'GMAIL_APP_PASSWORD','RAZORPAY_KEY_SECRET','RAZORPAY_WEBHOOK_SECRET'}),
 'teemtreat-visualizer':('asia-south1',{'RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','RAZORPAY_WEBHOOK_SECRET'})}
def cloud(project,*args):
 result=subprocess.run(['gcloud',*args,'--project='+project,'--format=json','--quiet'],capture_output=True,text=True)
 if result.returncode:raise RuntimeError('Cloud metadata check failed: '+ ' '.join(args[:3])+'. No further versions destroyed. Check gcloud authentication and permissions.')
 return json.loads(result.stdout or 'null')
def plan(versions,used):
 if not versions:return []
 latest=max(versions,key=lambda v:int(v['name'].split('/')[-1]));number=latest['name'].split('/')[-1]
 if latest['state']!='ENABLED':raise RuntimeError('Newest version is not enabled; automatic cleanup blocked.')
 old=[v['name'].split('/')[-1] for v in versions if v['state']!='DESTROYED' and v is not latest]
 if set(old)&used:raise RuntimeError('An older version is still referenced by a deployed workload; redeploy all consumers first.')
 if any(v not in (number,'latest') for v in used):raise RuntimeError('A workload uses an old version or alias; cleanup blocked.')
 return old
def references(project,region):
 used={}
 def add(secret,version):
  used.setdefault(secret,set()).add(str(version))
 functions=cloud(project,'functions','list') or []
 for f in functions:
  if f.get('state',f.get('status'))!='ACTIVE':raise RuntimeError('A function is not ACTIVE; cleanup blocked.')
  config=f.get('serviceConfig',f)
  if config.get('secretVolumes'):raise RuntimeError('Secret volumes require manual reference review; cleanup blocked.')
  for ref in config.get('secretEnvironmentVariables',[]):add(ref['secret'],ref['version'])
 services=cloud(project,'run','services','list') or []
 for service in services:
  location=service['metadata'].get('labels',{}).get('cloud.googleapis.com/location',region)
  status=service.get('status',{});revisions={status.get('latestReadyRevisionName'),status.get('latestCreatedRevisionName')}
  for target in status.get('traffic',[]):
   if target.get('percent',0)>0 or target.get('tag'):revisions.add(target.get('revisionName'))
  for revision in revisions-{None}:
   rev=cloud(project,'run','revisions','describe',revision,'--region='+location)
   spec=rev.get('spec',{})
   if any(v.get('secret') for v in spec.get('volumes',[])):raise RuntimeError('Cloud Run secret volumes require manual review; cleanup blocked.')
   aliases=rev.get('metadata',{}).get('annotations',{}).get('run.googleapis.com/secrets','')
   mapping=dict(x.split(':',1) for x in aliases.split(',') if ':' in x)
   for container in spec.get('containers',[]):
    for env in container.get('env',[]):
     ref=env.get('valueFrom',{}).get('secretKeyRef')
     if ref:add(mapping.get(ref['name'],ref['name']).split('/')[-1],ref['key'])
 # These repositories deploy Functions, not Jobs. Refuse unfamiliar job consumers.
 if cloud(project,'run','jobs','list','--region='+region):raise RuntimeError('Cloud Run Jobs found; review their secret references before automatic cleanup.')
 return used
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--project',required=True,choices=SCOPES);parser.add_argument('--apply',action='store_true');args=parser.parse_args()
 region,secrets=SCOPES[args.project];used=references(args.project,region);targets=[]
 for secret in sorted(secrets):
  versions=cloud(args.project,'secrets','versions','list',secret) or []
  old=plan(versions,used.get(secret,set()));targets.extend((secret,v) for v in old)
  print(secret+': '+str(len(old))+' older retained version(s); newest preserved.')
 if not targets:print('Already latest-only. No changes required.');return
 if not args.apply:print('Audit only. Add --apply to destroy the listed older versions.');return
 # Refresh references before mutations; never clean up ahead of a rolling deployment.
 used=references(args.project,region)
 for secret,version in targets:
  versions=cloud(args.project,'secrets','versions','list',secret) or []
  if version not in plan(versions,used.get(secret,set())):raise RuntimeError('Version state changed during cleanup; stopped.')
  cloud(args.project,'secrets','versions','destroy',version,'--secret='+secret)
  print('Destroyed '+secret+' version '+version)
if __name__=='__main__':
 try:main()
 except (RuntimeError,KeyError,ValueError,OSError) as error:print('Secret cleanup stopped: '+str(error),file=sys.stderr);sys.exit(1)
