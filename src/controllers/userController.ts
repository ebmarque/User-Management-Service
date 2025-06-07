import fastify, { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../server";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
const bcrypt = require('bcrypt');

// ================================== POST ==================================

exports.createUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username, password } = req.body as { username: string, password: string };
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				username: username,
				password: hashedPassword
			},
			omit: {
				password: true
			}
		})
		return res.code(201).send({ message: "user successfully created!", user });
	} catch (err) {
		res.code(500).send({ message: "Internal Server error.", error: err });
	}
}


// ================================== GET ==================================
exports.getAll = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const users = await prisma.user.findMany({
			omit: {
				password: true
			}
		});
		return users ? res.code(200).send(users) : res.code(404).send({ message: "No user was found!" });
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}

exports.getByUsername = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string }
		const user = await prisma.user.findFirst({
			where: {
				username: username
			},
			omit: {
				password: true
			}
		});

		return user ? res.code(200).send(user) : res.code(404).send({ message: "User not found!" });
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}


// ================================== PATCH ==================================

exports.disableUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };

		await prisma.user.update({
			where: { username },
			data: { active: false }
		})
		return res.code(200).send({ message: "User disabled successfully" });

	} catch (err: unknown) {
		if (
			err instanceof PrismaClientKnownRequestError &&
			err.code == 'P2025'
		) {
			return res.code(404).send({ message: 'User not found!' });
		}

		return res.code(500).send({ message: 'Internal Server Error', error: err });
	}
};


// ================================== DELETE ==================================

exports.deleteUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string }
		const user = await prisma.user.delete({
			where: {
				username: username
			},
			omit: {
				password: true
			}
		});
		return user ? res.code(200).send({ message: "User deleted successfully!" }) : res.code(404).send({ message: "User not found!" });
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}


