/**
 * Typed hooks — import these instead of the plain `useDispatch` / `useSelector`
 * from react-redux so TypeScript knows the full store shape.
 */
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector)
