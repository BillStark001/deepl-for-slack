gcloud functions deploy nodejs-http-function \
--gen2 \
--runtime=nodejs18 \
--region=asia-northeast1 \
--source=./lib \
--entry-point=deepLSlackBot \
--trigger-http \
--allow-unauthenticated