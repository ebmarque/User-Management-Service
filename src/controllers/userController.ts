import fastify, { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../server";

exports.createUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username, password } = req.body as { username: string, password: string };
		const user = await prisma.user.create({
			data: {
				username: username,
				password: password
			}
		})
		return res.code(201).send({ message: "user successfully created!", user });
	} catch (err) {
		res.code(500).send({ message: "Internal Server error.", error: err });
	}
}

exports.getAll = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const users = await prisma.user.findMany();
		return res.code(200).send(users);
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}

exports.getById = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { id } = req.params as { id: string }
		const user = await prisma.user.findFirst({
			where: {
				id: id
			}
		});
		return res.code(200).send(user);
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}

exports.deleteUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { id } = req.params as { id: string }
		const user = await prisma.user.delete({
			where: {
				id: id
			}
		});
		return res.code(200).send(user);
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}
