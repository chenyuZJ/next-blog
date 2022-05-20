import axios from 'axios';
let baseURL: string;
if (process.env.NODE_ENV === 'production') {
  baseURL = 'http://localhost:8081/';
} else {
  baseURL = 'http://localhost:8081/';
}

// 拦截器
axios.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);
axios.interceptors.request.use(
  (config) => {
    // config.headers['Accept'] = 'application/vnd.dpexpo.v1+json';
    config.baseURL = baseURL;
    config.timeout = 10000;
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// axios的get请求
export function get(url: string, params = {}) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params,
      })
      .then((res) => {
        resolve(res.data.data);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

// axios的post请求
export function post(url: string, data: any) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'post',
      data,
    })
      .then((res) => {
        resolve(res.data.data);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

export default axios;
