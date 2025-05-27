import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from "../lib/api";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const {data:friends=[], isLoading:loadingFriends} = useQuery({
    queryKey:["friends"],
    queryFn: getUserFriends
  });
const { data, isLoading: loadingUsers } = useQuery({
  queryKey: ["users"],
  queryFn: getRecommendedUsers
});
const recommendedUsers = data?.recommendedUsers || [];

console.log('Recommended Users Data:', {
  data,
  recommendedUsers,
  isLoading: loadingUsers
});

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs ,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (error) => {
      console.error("Error sending friend request:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Failed to send friend request");
    }
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if(outgoingFriendReqs && outgoingFriendReqs.length > 0){
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id.toString());
      });
    }
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]); 

  const isRequestPending = (userId) => {
    return outgoingRequestsIds.has(userId.toString());
  };

  // Filter users based on search query
  const filteredUsers = recommendedUsers.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      (user.location && user.location.toLowerCase().includes(searchLower)) ||
      (user.interests && user.interests.toLowerCase().includes(searchLower))
    );
  });

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => {
    const searchLower = friendsSearchQuery.toLowerCase();
    return (
      friend.fullName.toLowerCase().includes(searchLower) ||
      (friend.location && friend.location.toLowerCase().includes(searchLower)) ||
      (friend.interests && friend.interests.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends Search Bar */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your friends by name, location, or interests..."
              className="input input-bordered w-full pl-10"
              value={friendsSearchQuery}
              onChange={(e) => setFriendsSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-base-content opacity-70" />
          </div>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"/>
          </div>
        ): filteredFriends.length === 0 ? (
          <div className="card bg-base-200 p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">
              {friendsSearchQuery ? "No matching friends found" : "No friends yet"}
            </h3>
            <p className="text-base-content opacity-70">
              {friendsSearchQuery ? "Try adjusting your search criteria" : "Start adding friends to see them here!"}
            </p>
          </div>
        ) :(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Friends</h2>
                <p className="opacity-70">
                  Discover passionate people with similar interests and expand your network.
                </p>
              </div>
            </div>

            {/* Recommended Users Search Bar */}
            <div className="mt-4 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, location, or interests..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-base-content opacity-70" />
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg"/>
            </div>
          ): filteredUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? "No matching users found" : "No recommendations available"}
              </h3>
              <p className="text-base-content opacity-70">
                {searchQuery ? "Try adjusting your search criteria" : "Check back later for new friends!"}
              </p>
            </div>
          ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => {
                return (
                  <div key={user._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                    <div className="card-body p-5 spce-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePicture} alt={user.fullName} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {user.interests && (
                          <div className="flex items-center text-xs opacity-70 mt-1">
                            {user.interests}
                          </div>
                        )}
                      </div>
                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${
                          isRequestPending(user._id) ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => {
                          if (!isRequestPending(user._id)) {
                            sendRequestMutation(user._id.toString());
                          }
                        }}
                        disabled={isRequestPending(user._id) || isPending}
                      >
                        {isRequestPending(user._id) ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FriendsPage;