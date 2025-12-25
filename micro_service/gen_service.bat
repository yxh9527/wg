for %%i in (proto/*.proto) do (
    protoc30 --proto_path=./proto --go_out=plugins=grpc:./services %%i
)
pause;