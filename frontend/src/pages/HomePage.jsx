import { Chat, ChannelList, Channel } from "stream-chat-react";
import { useThemeStore } from "../store/useThemeStore";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getStreamToken } from "../lib/api";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { useAppContext } from "../components/useAppContext";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CustomPreview = ({ channel, setActiveChannel }) => {
  const { authUser } = useAuthUser();
  const memberIds = Object.keys(channel.state.members);
  const otherMemberId = memberIds.find(id => id !== authUser._id);
  const otherMember = channel.state.members[otherMemberId]?.user;
  
  const lastMessage = channel.state.messages[channel.state.messages.length - 1]?.text || 'No messages yet';
  const shortenedMessage = lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;
  
  return (
    <div className="str-chat__channel-preview-messenger">
      <Link 
        to={`/chat/${otherMemberId}`}
        className="w-full h-full"
        onClick={() => setActiveChannel(channel)}
      >
        <div className="str-chat__channel-preview-messenger--left">
          <div className="flex items-center gap-3">
            <div className="avatar size-10">
              <img 
                src={otherMember?.image || 'https://via.placeholder.com/40'} 
                alt={otherMember?.name || 'User'} 
                className="rounded-full"
              />
            </div>
            <div>
              <div className="str-chat__channel-preview-messenger--name font-semibold">
                {otherMember?.name || 'Unknown User'}
              </div>
              <div className="str-chat__channel-preview-messenger--last-message text-sm opacity-70 truncate max-w-[200px]">
                {shortenedMessage}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const HomePage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authUser, isLoading: authLoading } = useAuthUser();
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: false,
  });
  const { theme } = useThemeStore();
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      toast.error("Please login to access chat");
      navigate("/login");
      return;
    }

    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        if (client.userID) await client.disconnectUser();

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        setChatClient(client);

        if (targetUserId) {
          const channel = client.channel("messaging", {
            members: [authUser._id, targetUserId],
          });
          await channel.watch();
          setSelectedChannel(channel);
        }
      } catch (error) {
        console.error("Chat error:", error);
        toast.error("Could not connect to chat");
        if (error.message?.includes("unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [tokenData, authUser, targetUserId, authLoading, navigate]);

  if (loading || authLoading || !chatClient) {
    return (
      <div className="flex justify-center items-center h-[83vh] w-full">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const filters = { 
    type: "messaging",
    members: { $in: [authUser?._id] }
  };
  const options = { presence: true, state: true };
  const sort = { last_message_at: -1 };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="h-[83vh] home-page">
        <Chat client={chatClient} theme={`str-chat__theme-${theme}`}>
          {selectedChannel ? (
            <Channel channel={selectedChannel}>
              {/* Add your channel UI components here */}
            </Channel>
          ) : (
            <ChannelList
              filters={filters}
              options={options}
              sort={sort}
              Preview={CustomPreview}
            />
          )}
        </Chat>
      </div>
    </div>
  );
};

export default HomePage;