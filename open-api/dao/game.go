package dao

import (
	"app/tables/manager"
	"sync"
)

var GameCacheIns *GameCacheMgr

type GameCacheMgr struct {
	lock  *sync.Mutex
	Games map[int64]*manager.Game
}

func loadGameData() {
	GameCacheIns.lock.Lock()
	defer GameCacheIns.lock.Unlock()
	games := make([]*manager.Game, 0, 128)
	Mysql().Manager.Model(manager.Game{}).Debug().Find(&games)
	for _, v := range games {
		GameCacheIns.Games[int64(v.Number)] = v
	}
}

// 加载游戏缓存列表
func InitGameCacheMgr() {
	if GameCacheIns == nil {
		GameCacheIns = &GameCacheMgr{
			lock:  &sync.Mutex{},
			Games: make(map[int64]*manager.Game),
		}
		loadGameData()
	}
}

func (gcm *GameCacheMgr) GetGame(number int64) *manager.Game {
	gcm.lock.Lock()
	defer gcm.lock.Unlock()

	game := gcm.Games[number]
	if game == nil {
		game = &manager.Game{}
		Mysql().Manager.Model(manager.Game{}).Debug().Where("number = ?", number).Take(game)
		gcm.Games[number] = game
	}
	return game
}
