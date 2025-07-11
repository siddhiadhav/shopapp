import { JwtPayload } from '@shopverse/common'
import {AppModule} from './module'
import express  from 'express'
declare global{
    namespace Express {
        interface Request {
            currentUser?: JwtPayload
        }
    }
}
const bootstrap = ()=>{
    const app= new AppModule(express())//we get access to start method which is in module.ts
    app.start()
}
bootstrap()