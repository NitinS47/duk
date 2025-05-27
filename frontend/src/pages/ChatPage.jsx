import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { useThemeStore } from "../store/useThemeStore";
import { ArrowLeftIcon, XIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CustomPreview = ({ channel, setActiveChannel }) => {
  const { authUser } = useAuthUser();
  const memberIds = Object.keys(channel.state.members);
  const otherMemberId = memberIds.find(id => id !== authUser._id);
  const otherMember = channel.state.members[otherMemberId]?.user;

  const lastMessage = channel.state.messages[channel.state.messages.length - 1]?.text || 'No messages yet';
  const shortenedMessage = lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;

  return (
    <div className="str-chat__channel-preview-messenger relative flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-base-200/70 dark:hover:bg-base-300/60 transition-colors">
      <Link 
        to={`/chat/${otherMemberId}`}
        className="w-full h-full"
        onClick={() => setActiveChannel(channel)}
      >
        <div className="flex items-center gap-3">
          <div className="avatar size-10">
            <img 
              src={otherMember?.image || 'https://via.placeholder.com/40'} 
              alt={otherMember?.name || 'User'} 
              className="rounded-full"
            />
          </div>
          <div>
            <div className="font-semibold">
              {otherMember?.name || 'Unknown User'}
            </div>
            <div className="text-sm opacity-70 truncate max-w-[200px]">
              {shortenedMessage}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);


  const filters = { 
    type: "messaging",
    members: { $in: [authUser?._id] }
  };
  const options = { presence: true, state: true };
  const sort = { last_message_at: -1 };

  const handleChannelSelect = (selectedChannel) => {
    const memberIds = Object.keys(selectedChannel.state.members);
    const otherMemberId = memberIds.find(id => id !== authUser._id);

    if (otherMemberId) {
      navigate(`/chat/${otherMemberId}`);
    }
  };

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !STREAM_API_KEY) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `🚀 A video call has started!\n\n[👉 Join Video Call](${callUrl})`,
      });

      toast.success("Video call message sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[91vh] chat-page">
      <Chat client={chatClient} theme={`str-chat__theme-${theme}`}>
        {!isMobile ? (
          <div className="flex h-full">
            <ChannelList 
              sort={sort} 
              filters={filters} 
              options={options}
              onSelect={handleChannelSelect}
              Preview={CustomPreview}
            />
            <Channel channel={channel}>
              <CallButton handleVideoCall={handleVideoCall} />
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </div>
        ) : (
          <div className="flex h-full">
            <Channel channel={channel}>
              <CallButton handleVideoCall={handleVideoCall} />
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </div>
    
        )
}
      </Chat>
    </div>
  );
};

export default ChatPage;
