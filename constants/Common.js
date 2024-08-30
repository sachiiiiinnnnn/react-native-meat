import axios from 'axios';

export const BaseUrl = `http://192.168.1.18:8080`;

export const instance = axios.create({
  baseURL: BaseUrl,

}); 