import axios from 'axios';
import * as AuthActions from '@/actions/auth.action';
import eventBus from '@/hooks/eventBus.hook';
import service from '@/utils/backend/auth';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { getStore } from '@/store/index.store';
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEPTURE_API_URL,
  timeout: 60000,
});

// Add a request interceptor
http.interceptors.request.use(
  config => {
    const store = getStore();
    let state = store.getState() as any;
    const access_token = state?.auth?.auth?.access_token;
    console.log(' request refresh token', access_token);
    // const state = JSON.parse(
    //   localStorage.getItem(`persist:${process.env.NEXT_PUBLIC_KEY_STORE}`) ||
    //     null,
    // );
    // const auth = JSON.parse(state?.auth || null);
    // const tech = auth?.auth?.tech;
    // if (tech?.message && tech?.signature && tech?.data?.address) {
    //   config.headers.authorize = `${tech?.message}:${tech?.signature}`;
    //   config.headers.address = tech?.data?.address;
    // }
    // get from store
    // let stateStore = store.getState();
    // console.log(stateStore.auth, 'auth from store');
    // const techStore = stateStore?.auth?.auth?.tech;
    // if (
    //   techStore?.message &&
    //   techStore?.signature &&
    //   techStore?.data?.address
    // ) {
    //   config.headers.authorize = `${techStore?.message}:${techStore?.signature}`;
    //   config.headers.address = techStore?.data?.address;
    // }
    return config;
  },
  error => Promise.reject(error),
);

let isAlreadyFetchingAccessToken = false;

let subscribers = [] as any;

const onAccessTokenFetched = (access_token: any) => {
  const mappedSubcribers = [...subscribers];
  mappedSubcribers.forEach(callback => callback(access_token));
  subscribers = [];
};

const addSubscriber = (callback: any) => {
  subscribers.push(callback);
};

// Add a response interceptor
http.interceptors.response.use(
  async response => {
    // Return JSON data
    return response?.data?.data || response?.data || response;
  },
  async error => {
    const err = (error.response && error.response.data) || error;
    const { config } = error;
    const originalRequest = config;
    const store = getStore();
    if (error.response && error.response.status === 401) {
      let state = store.getState() as any;
      const refresh_token = state?.auth?.auth?.refresh_token;
      console.log('refresh token', state, refresh_token);

      if (!isAlreadyFetchingAccessToken && refresh_token) {
        isAlreadyFetchingAccessToken = true;

        try {
          const res = (await service.refreshToken(refresh_token)) as any;
          if (res.access_token && res.refresh_token) {
            store.dispatch(
              AuthActions.refreshToken({
                access_token: res.access_token,
                refresh_token: res.refresh_token,
              }),
            );

            console.log('new token', res.access_token, res.refresh_token);
            originalRequest.headers['Authorization'] = `Bearer ${res.access_token}`;
          }

          return http(originalRequest);
          // return retryOriginalRequest;
        } catch (err) {
          console.log(err);
          eventBus.emit('openSignInModal');
          // store.dispatch(AuthActions.resetState());
        }
      }
    }

    if (error.response && error.response.status) {
      err.status = error.response.status;
    }

    return Promise.reject(err);
  },
);
export default http;
