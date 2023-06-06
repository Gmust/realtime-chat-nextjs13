import { fetchRedis } from '@/helpers/redis';

export const getFriendsByUserId = async (userId: string) => {
  //retrieve friends from current user
  const friendIds = await (fetchRedis('smembers', `user:${userId}:friends`)) as string[];

  const friends = await Promise.all(
    friendIds.map(async (fiendId) => {
      const friend = await fetchRedis('get', `user:${fiendId}`) as string;
      const parsedFriend = JSON.parse(friend) as User;
      return parsedFriend;
    })
  );

  return friends;
};