for %%i in (proto/*.proto) do (
    protoc3.9 --proto_path=./proto --go_out=plugins=grpc:./services %%i
)
pause;