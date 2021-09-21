import { AxiosResponse } from 'axios'
import { api } from './api'


interface responseData {
  id: number,
  amount: number
}

interface IGetStockService {
  (productId: number): Promise<AxiosResponse<responseData[]>>
}


export const getStock : IGetStockService = (productId: number) => {
  return api.get('/stock?', {
    params: {
      id: productId
    }
  })
}