import * as express from "express"
import {postgresClient} from "../postgre/postgresClient"
import * as uniqid from "uniqid"
import * as jwt from  "jsonwebtoken"

class AuthenticationController{
	path="/auth"
	router = express.Router()
	constructor(){
		this.initRoutes()
	}

	initRoutes(){
		this.router.post(`${this.path}/login`, this.login)
		this.router.post(`${this.path}/register`, this.register)
	}

	private login = async(request, response)=>{
		try{
			
			let email = request.body.email
			let password = request.body.password
			let user = (await postgresClient.query(`SELECT * FROM users WHERE email='${email}';`)).rows[0]
			
			if(user){
				if(user.password==password){
					let token = this.createToken(user)
					let cookie = this.createCookie(token)
					response.setHeader("Set-Cookie", cookie)
					response.send("auth Ok")
				}else{
					response.send("wrong password")
				}
				
			}else{
				response.send("user with this email not found")
			}
		}catch(error){
			console.log(error)
		}
	}


	private register = async(request, response)=>{
		try{
			console.log(request.body)
			let email = request.body.email
			let password = request.body.password
			let name = request.body.name
			let user = (await postgresClient.query(`SELECT * FROM users WHERE email='${email}';`)).rows[0]
			if(user){
				response.send("user whith this email already registed")
			}else{
				let user = await postgresClient.query(
					`INSERT INTO users (id, name, email, password) VALUES ('${uniqid()}', '${name}', '${email}', '${password}');`
					)

				response.send("registed OK!")
			}



		}catch(error){
			console.log(error)
		}
	}

	private createToken(user){
		let token = jwt.sign({
			id: user.id
		}, "SECRET_KEY")

		return token
	}

	private createCookie(token){
		let cookie = `Authentication=${token}`
		return cookie
	}
}

export {AuthenticationController}