import FriendProfilePageClient from "./_components/FriendProfilePageClient";

interface FriendProfilePageProps {
  params: Promise<{
    friendPublicId: string;
  }>;
}

export default async function FriendProfilePage({ params }: FriendProfilePageProps) {
  const { friendPublicId } = await params;

  return <FriendProfilePageClient friendPublicId={friendPublicId} />;
}
