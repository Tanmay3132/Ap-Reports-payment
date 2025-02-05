import { API_KEY } from "@/config";
import { NextFunction, Request, Response } from "express";
import { HttpException } from '@exceptions/HttpException';
import { logger } from "@/utils/logger";


export const apiKeyAuthenticationMiddleware = ( req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKey : string | undefined = req.headers['api_key'] as string;
        if(!apiKey){
            logger.error(JSON.stringify({ function: "apiKeyAuthenticationMiddleware", request : {query:req.query, headers:req.headers} ,error:"API Key is missing"}));
            throw new HttpException(401, 'API Key is missing');
        }
        if(apiKey !==API_KEY){
            logger.error(JSON.stringify({ function: "apiKeyAuthenticationMiddleware", request: { query: req.query, headers: req.headers }, error: "Invalid Api Key!" }));
            throw new HttpException(403, "Invalid Api Key!");
        }
        next();
    } catch (error) {
        next(error);
    }
};