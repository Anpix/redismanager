package handlers

import (
	"encoding/json"
	"strconv"

	"github.com/Lukiya/redismanager/src/go/core"
	"github.com/go-redis/redis/v7"
	"github.com/kataras/iris/v12"
	u "github.com/syncfuture/go/util"
)

func getClient(ctx iris.Context) (r redis.Cmdable) {
	if core.ClusterClient == nil {
		dbStr := ctx.FormValueDefault("db", "0")
		db, err := strconv.Atoi(dbStr)
		if u.LogError(err) {
			return nil
		}
		return core.DBClients[db]
	} else {
		return core.ClusterClient
	}
}

func handleError(ctx iris.Context, err error) bool {
	if u.LogError(err) {
		ctx.WriteString(err.Error())
		return true
	}
	return false
}

func writeMsgResultError(ctx iris.Context, mr *core.MsgResult, err error) bool {
	if u.LogError(err) {
		mr.MsgCode = err.Error()
		ctx.WriteString(err.Error())
		return true
	}
	return false
}

func writeMsgResult(ctx iris.Context, mr *core.MsgResult, msg string) {
	mr.MsgCode = msg
	jsonBytes, err := json.Marshal(mr)
	u.LogError(err)
	ctx.Write(jsonBytes)
}