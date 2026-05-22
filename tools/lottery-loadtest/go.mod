module lottery-loadtest

go 1.24.0

require (
	micro_service v0.0.0
	google.golang.org/grpc v1.78.0
	google.golang.org/protobuf v1.36.10
	github.com/shopspring/decimal v1.4.0
	go.uber.org/zap v1.27.1
)

replace micro_service => ../../micro_service
