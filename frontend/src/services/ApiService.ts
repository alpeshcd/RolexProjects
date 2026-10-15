import AxiosBase from './axios/AxiosBase'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const ApiService = {
    // Existing fetchDataWithAxios method for GET/POST requests
    fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>,
    ) {
        return new Promise<Response>((resolve, reject) => {
            AxiosBase(param)
                .then((response: AxiosResponse<Response>) => {
                    resolve(response.data)
                })
                .catch((errors: AxiosError) => {
                    reject(errors)
                })
        })
    },

    // New deleteDataWithAxios method for DELETE requests
    deleteDataWithAxios<Response = unknown>({
        url,
        params,
        ...config
    }: {
        url: string
        params?: Record<string, any> 
    }) {
        return new Promise<Response>((resolve, reject) => {
            AxiosBase.delete(url, { params, ...config }) 
                .then((response: AxiosResponse<Response>) => {
                    resolve(response.data)
                })
                .catch((errors: AxiosError) => {
                    reject(errors)
                })
        })
    },
}

export default ApiService
