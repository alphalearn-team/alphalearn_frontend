import OnlineLobbyRoomScreen from "../_components/OnlineLobbyRoomScreen";

interface OnlineLobbyRoomPageProps {
  params: Promise<{
    lobbyPublicId: string;
  }>;
}

export default async function OnlineLobbyRoomPage({
  params,
}: OnlineLobbyRoomPageProps) {
  const { lobbyPublicId } = await params;
  return <OnlineLobbyRoomScreen lobbyPublicId={lobbyPublicId} />;
}
