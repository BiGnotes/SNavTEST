import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

/**
 * 获取天气
 * https://lbs.amap.com/api/webservice/guide/api/weatherinfo
 */
// 获取高德地理位置信息
export const getAdcode = async (key) => {
  return axios({
    method: "GET",
    url: "https://restapi.amap.com/v3/ip",
    params: { key },
  });
};

// 获取腾讯地理位置信息
export const getTxLocation = async (key) => {
  return axios({
    method: "GET",
    url: "https://apis.map.qq.com/ws/location/v1/ip",
    params: { key, output: "json" },
  });
};

// JSONP方式获取腾讯地理位置信息
export const getTxLocation2 = (key) => {
  return new Promise((resolve, reject) => {
    // 参数验证
    if (!key) return reject(new Error('缺少API密钥'));
    
    const callbackName = `jsonp_${Date.now()}`;
    const timeout = 10000;
    let script = null;
    
    // 超时处理
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('请求超时'));
    }, timeout);
    
    // 清理函数
    const cleanup = () => {
      clearTimeout(timer);
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window[callbackName];
    };
    
    // 成功回调
    window[callbackName] = (data) => {
      cleanup();
      if (data.status !== 0) {
        reject(new Error(data.message || '腾讯API错误'));
      } else {
        resolve(data);
      }
    };
    
    // 创建script标签
    script = document.createElement('script');
    script.src = `https://apis.map.qq.com/ws/location/v1/ip?key=${encodeURIComponent(key)}&output=jsonp&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP 请求失败'));
    };
    
    // 发送请求
    document.body.appendChild(script);
  });
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  return axios({
    method: "GET",
    url: "https://restapi.amap.com/v3/weather/weatherInfo",
    params: { key, city, extensions: "base" },
  });
};

/**
 * 获取搜索建议
 * https://suggestion.baidu.com
 * @param {String} keyWord - 搜索关键字
 */
export const getSearchSuggestions = async (keyWord) => {
  try {
    const encodedKeyword = encodeURIComponent(keyWord);
    const response = await fetchJsonp(
      `https://suggestion.baidu.com/su?wd=${encodedKeyword}&cb=json`,
      {
        // 回调参数
        jsonpCallback: "cb",
      },
    );
    const data = await response.json();
    return data.s;
  } catch (error) {
    console.error("处理搜索建议发生错误：", error);
    return null;
  }
};
