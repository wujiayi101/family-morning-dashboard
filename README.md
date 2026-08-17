# 家庭晨間儀表板 🌅

給家人早上出門前快速查看資訊的儀表板，適合放在平板或電腦上全屏顯示。

## 顯示內容

| 項目 | 數據來源 |
|------|----------|
| 天氣 & 溫度 | 香港天文台 Open Data |
| 濕度 | 香港天文台 |
| 穿衣指數 | 根據溫度自動計算 |
| 空氣質素 (PM2.5) | Open-Meteo |
| 98A 巴士 → 牛頭角 | 九巴實時 ETA (data.gov.hk) |

## 快速開始

直接在瀏覽器打開 `index.html`，或使用本地伺服器：

```bash
cd family-morning-dashboard
python3 -m http.server 8080
# 瀏覽 http://localhost:8080
```

## 自訂設定

編輯 `config.js`：

```javascript
window.DASHBOARD_CONFIG = {
  busStopId: "5BE08E5DCD826740",  // 你的候車站 ID
  busStopName: "坑口站",           // 顯示名稱（備用）
  weatherPlace: "將軍澳",          // HKO 測站名稱
  refreshInterval: 60000,          // 刷新間隔（毫秒）
};
```

### 98A 巴士站 ID 參考（牛頭角方向）

| 站序 | 站名 | Stop ID |
|------|------|---------|
| 1 | 坑口(北) (將軍澳醫院) | `92BC52AEBC658E49` |
| 2 | 重華路 東港城 | `9B0382206D441221` |
| 3 | 坑口站 | `5BE08E5DCD826740` |
| 4 | 厚德邨 | `ECD84D5B8C52642B` |
| 5 | 景林邨 | `1078119989C67B82` |
| 6 | 欣明苑 | `FCDC63F245F7F22B` |
| 7 | 英明苑 | `544FDBB0FC074ABC` |
| 8 | 寶仁樓 | `D8CEF4232A0B7E4D` |
| 9 | 翠林邨 | `3CEDAAAC5071EF7B` |
| 10 | 康盛花園 | `4A84482F3A54E4CC` |

查詢其他站點：  
`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/98A/outbound/1`

## 部署到 GitHub Pages

1. Push 此 repo 到 GitHub
2. 進入 repo **Settings → Pages**
3. Source 選 **Deploy from a branch**，Branch 選 `main` / `/ (root)`
4. 幾分鐘後即可在 `https://<username>.github.io/family-morning-dashboard/` 訪問

## 技術說明

- 純前端靜態頁面，無需後端或 API Key
- 每 60 秒自動刷新（可在 config 修改）
- 所有 API 均為香港政府開放數據，免費使用
