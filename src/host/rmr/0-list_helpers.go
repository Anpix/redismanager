package rmr

import (
	"context"
	"strconv"

	"github.com/go-redis/redis/v8"
	"github.com/syncfuture/go/serr"
)

func saveList(ctx context.Context, client redis.UniversalClient, cmd *SaveRedisEntryCommand) (err error) {
	if cmd.IsNew {
		err = client.RPush(ctx, cmd.New.Key, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	} else if cmd.New.Key != cmd.Old.Key {
		// rename key
		err = client.Rename(ctx, cmd.Old.Key, cmd.New.Key).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	if cmd.New.Field != "" {
		// # update value
		index, err := strconv.ParseInt(cmd.New.Field, 10, 64)
		if err != nil {
			return serr.WithStack(err)
		}
		err = client.LSet(ctx, cmd.New.Key, index, cmd.New.Value).Err()
		if err != nil {
			return serr.WithStack(err)
		}
	}

	return
}

func getListMembers(ctx context.Context, client redis.UniversalClient, query *MembersQuery) (*MembersQueryResult, error) {
	keys, err := client.LRange(ctx, query.Key, int64(query.Cursor), int64(query.Cursor)+query.Count).Result()
	if err != nil {
		return nil, serr.WithStack(err)
	}

	r := new(MembersQueryResult)
	r.Members = make([]*MemberResult, 0, query.Count)

	if len(keys) == 0 {
		query.Cursor = 0
	} else {
		for i := range keys {
			r.Members = append(r.Members, &MemberResult{
				Field: query.Cursor + uint64(i),
				Value: keys[i],
			})
		}
		r.Cursor = query.Cursor + uint64(query.Count) + 1
	}

	return r, nil
}