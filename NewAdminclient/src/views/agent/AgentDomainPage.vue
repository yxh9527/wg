<template>
  <div class="page-shell">
    <el-card shadow="never" class="content-card domain-card">
      <div class="panel-head">
        <div>
          <div class="panel-kicker">Domain</div>
          <div class="panel-title">配置详情</div>
          <div class="panel-note">维护游戏客户端地址和回放地址，修改后通常需要等待约 10 秒生效。</div>
        </div>
        <div class="panel-actions">
          <el-button type="primary" @click="dialogVisible = true">修改地址</el-button>
        </div>
      </div>

      <div class="domain-grid">
        <div class="domain-panel">
          <div class="domain-label">游戏客户端地址</div>
          <div class="domain-value">{{ gameUrl || "-" }}</div>
          <div class="domain-sub">用于客户端连接和加载游戏资源。</div>
        </div>

        <div class="domain-panel">
          <div class="domain-label">游戏回放地址</div>
          <div class="domain-value">{{ replay || "-" }}</div>
          <div class="domain-sub">用于注单详情回放和分享页展示。</div>
        </div>
      </div>

      <div class="domain-footer">
        <span class="warn-text">修改后通常需要等待约 10 秒生效。</span>
      </div>
    </el-card>

    <el-dialog title="修改游戏客户端地址" :visible.sync="dialogVisible" width="720px">
      <el-form label-width="140px" class="domain-form">
        <el-form-item label="游戏客户端地址">
          <el-input
            v-model.trim="gameUrl"
            type="textarea"
            :rows="3"
            placeholder="https://127.0.0.1:1234"
          />
        </el-form-item>
        <el-form-item label="游戏回放地址">
          <el-input
            v-model.trim="replay"
            type="textarea"
            :rows="3"
            placeholder="https://127.0.0.1:1234"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveHandler">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getGameUrlConfig, updateGameUrlConfig } from "@/api/data";

export default {
  name: "AgentDomainPage",
  data() {
    return {
      dialogVisible: false,
      saving: false,
      gameUrl: "",
      replay: "",
    };
  },
  methods: {
    async loadConfig() {
      const response = await getGameUrlConfig();
      const payload = response.data.data || {};
      this.gameUrl = (payload.game_url || []).join(",");
      this.replay = (payload.replays || []).join(",");
    },
    async saveHandler() {
      this.saving = true;
      try {
        await updateGameUrlConfig({
          gameUrl: this.gameUrl,
          replay: this.replay,
        });
        this.$message.success("更新成功");
        this.dialogVisible = false;
      } finally {
        this.saving = false;
      }
    },
  },
  mounted() {
    this.loadConfig();
  },
};
</script>

<style lang="less" scoped>
.domain-card /deep/ .el-card__body {
  padding-top: 18px;
}

.domain-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.domain-panel {
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.domain-label {
  color: var(--text-sub);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.domain-value {
  margin-top: 10px;
  color: var(--text-main);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.7;
  word-break: break-all;
}

.domain-sub {
  margin-top: 8px;
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.domain-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.warn-text {
  color: #b45309;
  font-size: 13px;
  font-weight: 600;
}

.domain-form /deep/ .el-form-item {
  margin-bottom: 18px;
}

@media (max-width: 900px) {
  .domain-grid {
    grid-template-columns: 1fr;
  }

  .domain-footer {
    justify-content: flex-start;
  }
}
</style>
