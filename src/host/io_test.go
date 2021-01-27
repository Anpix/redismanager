package main

import (
	"io/ioutil"
	"strconv"
	"testing"
	"time"

	"github.com/syncfuture/go/sredis"

	"github.com/Lukiya/redismanager/src/go/io"

	"github.com/stretchr/testify/assert"

	"github.com/Lukiya/redismanager/src/go/core"
)

func TestExport(t *testing.T) {
	client := sredis.NewClient(core.RedisConfig)
	a := io.NewExporter(true, client)
	b, err := a.ExportKeys("A001", "A002", "A003", "A004", "A005")
	assert.NoError(t, err)
	assert.NotEmpty(t, b)

	ioutil.WriteFile("M:\\test.json", b, 666)
}

func TestImport(t *testing.T) {
	data, err := ioutil.ReadFile("M:\\test.json")
	assert.NoError(t, err)

	config := &sredis.RedisConfig{
		Addrs:    []string{"192.168.188.166:6379"},
		Password: "Famous901",
		DB:       15,
	}
	client := sredis.NewClient(config)
	a := io.NewImporter(client)
	_, err = a.ImportKeys(data)
	assert.NoError(t, err)
}

func TestFillData(t *testing.T) {
	config := &sredis.RedisConfig{
		Addrs:    []string{"192.168.188.166:6379"},
		Password: "Famous901",
		DB:       0,
	}
	client := sredis.NewClient(config)

	max := 139
	// for i := 0; i < max; i++ {
	// 	f := "field-" + strconv.Itoa(i)
	// 	v := "value " + strconv.Itoa(i)
	// 	err := client.HSet("testdata", f, v).Err()
	// 	if u.LogError(err) {
	// 		return
	// 	}
	// }

	for i := 0; i < max; i++ {
		k := "str-" + strconv.Itoa(i)
		v := "value " + strconv.Itoa(i)
		client.Set(k, v, time.Duration(-1))
	}
}
