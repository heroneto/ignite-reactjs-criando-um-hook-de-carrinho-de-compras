
import { AxiosResponse } from 'axios'
import { api } from './api'


interface responseData {
  id: number,
  title: string,
  price: number,
  image: string
}

interface IGetProduct {
  (productId: number): Promise<AxiosResponse<responseData[]>>
}


export const getProduct : IGetProduct = (productId: number) => {
  return api.get('/products', {
    params: {
      id: productId
    }
  })
}