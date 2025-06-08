import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '../../generated/prisma/runtime/library';

const prisma = new PrismaClient();

exports.sendFriendRequest = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { fromUserId, toUserId } = req.body as { fromUserId: string; toUserId: string };

		if (fromUserId === toUserId) return res.code(400).send({ message: "You can't add yourself" });

		const existing = await prisma.friendship.findFirst({
			where: {
				OR: [
					{ requesterId: fromUserId, recipientId: toUserId },
					{ requesterId: toUserId, recipientId: fromUserId }
				]
			}
		});
		if (existing) return res.code(400).send({ message: 'Friendship already exists or pending' });

		await prisma.friendship.create({
			data: {
				requesterId: fromUserId,
				recipientId: toUserId,
				status: 'PENDING'
			}
		});
		return res.code(201).send({ message: 'Friend request sent' });

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.getFriendRequests = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { userId } = req.params as { userId: string };

		const requests = await prisma.friendship.findMany({
			where: {
				recipientId: userId,
				status: 'PENDING'
			},
			include: {
				requester: { select: { id: true, username: true } }
			}
		});

		return res.send(requests);

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.respondToFriendRequest = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { friendshipId } = req.params as { friendshipId: string };
		const { accept } = req.body as { accept: boolean };

		const status = accept ? 'ACCEPTED' : 'REJECTED';

		await prisma.friendship.update({
			where: { id: friendshipId },
			data: { status }
		});

		return res.send({ message: `Friend request ${status.toLowerCase()}` });

	} catch (err) {
		if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
			return res.code(404).send({ message: 'Friend request not found' });
		}
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.listFriends = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { userId } = req.params as { userId: string };

		const friends = await prisma.friendship.findMany({
			where: {
				OR: [
					{ requesterId: userId },
					{ recipientId: userId }
				],
				status: 'ACCEPTED'
			},
			include: {
				requester: { select: { id: true, username: true } },
				recipient: { select: { id: true, username: true } }
			}
		});

		const result = friends.map((f: {
			requesterId: string;
			recipientId: string;
			requester: { id: string; username: string };
			recipient: { id: string; username: string };
		}) => {
			const friend = f.requesterId === userId ? f.recipient : f.requester;
			return { id: friend.id, username: friend.username };
		});

		return res.send(result);

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.removeFriend = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { userId, friendId } = req.body as { userId: string; friendId: string };

		await prisma.friendship.deleteMany({
			where: {
				OR: [
					{ requesterId: userId, recipientId: friendId },
					{ requesterId: friendId, recipientId: userId }
				],
				status: 'ACCEPTED'
			}
		});

		return res.send({ message: 'Friend removed' });

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};
