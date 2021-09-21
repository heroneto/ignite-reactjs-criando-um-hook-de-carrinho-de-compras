import { AxiosResponse } from 'axios'
import { api } from './api'


interface responseData {
  id: number,
  title: string,
  price: number,
  image: string
}

interface IGetProducts {
  (): Promise<AxiosResponse<responseData[]>>
}


export const getProducts : IGetProducts = () => {
  return api.get('/products')
}