gcloud functions deploy nodejs-http-function \
--gen2 \
--runtime=nodejs16 \
--region=asia-northeast-1 \
--source=./src/lib \
--entry-point=helloGET \
--trigger-http \
--allow-unauthenticated