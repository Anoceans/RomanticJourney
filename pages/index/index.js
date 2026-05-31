const STORAGE_KEY = 'visitedCityMap';

const CITIES = [
  { id: 1, name: '北京', province: '北京市', latitude: 39.9042, longitude: 116.4074 },
  { id: 2, name: '上海', province: '上海市', latitude: 31.2304, longitude: 121.4737 },
  { id: 3, name: '广州', province: '广东省', latitude: 23.1291, longitude: 113.2644 },
  { id: 4, name: '深圳', province: '广东省', latitude: 22.5431, longitude: 114.0579 },
  { id: 5, name: '杭州', province: '浙江省', latitude: 30.2741, longitude: 120.1551 },
  { id: 6, name: '南京', province: '江苏省', latitude: 32.0603, longitude: 118.7969 },
  { id: 7, name: '成都', province: '四川省', latitude: 30.5728, longitude: 104.0668 },
  { id: 8, name: '重庆', province: '重庆市', latitude: 29.563, longitude: 106.5516 },
  { id: 9, name: '西安', province: '陕西省', latitude: 34.3416, longitude: 108.9398 },
  { id: 10, name: '武汉', province: '湖北省', latitude: 30.5928, longitude: 114.3055 },
  { id: 11, name: '长沙', province: '湖南省', latitude: 28.2282, longitude: 112.9388 },
  { id: 12, name: '厦门', province: '福建省', latitude: 24.4798, longitude: 118.0894 },
  { id: 13, name: '青岛', province: '山东省', latitude: 36.0671, longitude: 120.3826 },
  { id: 14, name: '天津', province: '天津市', latitude: 39.3434, longitude: 117.3616 },
  { id: 15, name: '沈阳', province: '辽宁省', latitude: 41.8057, longitude: 123.4315 },
  { id: 16, name: '哈尔滨', province: '黑龙江省', latitude: 45.8038, longitude: 126.5349 },
  { id: 17, name: '昆明', province: '云南省', latitude: 25.0389, longitude: 102.7183 },
  { id: 18, name: '拉萨', province: '西藏自治区', latitude: 29.652, longitude: 91.1721 },
  { id: 19, name: '乌鲁木齐', province: '新疆维吾尔自治区', latitude: 43.8256, longitude: 87.6168 },
  { id: 20, name: '三亚', province: '海南省', latitude: 18.2528, longitude: 109.5119 }
];

Page({
  data: {
    cities: CITIES,
    mapCenter: {
      latitude: 35.8617,
      longitude: 104.1954
    },
    mapScale: 4,
    markers: [],
    visitedMap: {},
    visitedCount: 0,
    selectedCity: null,
    selectedVisited: false
  },

  onLoad() {
    const visitedMap = wx.getStorageSync(STORAGE_KEY) || {};
    this.refreshState(visitedMap);
  },

  onMarkerTap(event) {
    this.selectCity(Number(event.detail.markerId));
  },

  selectCityFromList(event) {
    this.selectCity(Number(event.currentTarget.dataset.id));
  },

  selectCity(id) {
    const selectedCity = CITIES.find((city) => city.id === id);

    if (!selectedCity) {
      return;
    }

    this.setData({
      selectedCity,
      selectedVisited: Boolean(this.data.visitedMap[id]),
      mapCenter: {
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude
      },
      mapScale: 7
    });
  },

  toggleSelectedCity() {
    const { selectedCity, visitedMap } = this.data;

    if (!selectedCity) {
      return;
    }

    const nextVisitedMap = {
      ...visitedMap,
      [selectedCity.id]: !visitedMap[selectedCity.id]
    };

    if (!nextVisitedMap[selectedCity.id]) {
      delete nextVisitedMap[selectedCity.id];
    }

    wx.setStorageSync(STORAGE_KEY, nextVisitedMap);
    this.refreshState(nextVisitedMap, selectedCity);
  },

  closeCityPanel() {
    this.setData({
      selectedCity: null,
      selectedVisited: false
    });
  },

  resetVisited() {
    wx.showModal({
      title: '重置旅行记录',
      content: '确认清空所有已旅游城市吗？',
      confirmText: '清空',
      confirmColor: '#d64545',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(STORAGE_KEY);
          this.refreshState({});
        }
      }
    });
  },

  noop() {},

  refreshState(visitedMap, selectedCity = this.data.selectedCity) {
    const cities = CITIES.map((city) => ({
      ...city,
      visited: Boolean(visitedMap[city.id])
    }));

    const markers = CITIES.map((city) => {
      const visited = Boolean(visitedMap[city.id]);

      return {
        id: city.id,
        latitude: city.latitude,
        longitude: city.longitude,
        title: city.name,
        width: 28,
        height: 28,
        callout: {
          content: city.name,
          color: visited ? '#0f6b3d' : '#44546c',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'BYCLICK'
        },
        label: {
          content: visited ? '✓' : '',
          color: '#ffffff',
          fontSize: 13,
          anchorX: -4,
          anchorY: -27
        },
        iconPath: visited ? '/assets/marker-visited.png' : '/assets/marker-unvisited.png'
      };
    });

    this.setData({
      cities,
      markers,
      visitedMap,
      visitedCount: Object.keys(visitedMap).length,
      selectedCity,
      selectedVisited: selectedCity ? Boolean(visitedMap[selectedCity.id]) : false
    });
  }
});
