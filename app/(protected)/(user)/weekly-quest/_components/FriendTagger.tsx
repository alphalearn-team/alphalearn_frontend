"use client";

import { useEffect, useRef, useState } from "react";
import { Loader, Stack, TextInput } from "@mantine/core";
import type { Friend } from "@/lib/utils/friends";
import { fetchFriendsList, searchFriends } from "@/lib/utils/friends";

interface FriendTaggerProps {
  /**
   * The user's access token for API calls
   */
  accessToken: string;

  /**
   * Array of selected friend public IDs
   */
  selectedFriendIds: string[];

  /**
   * Callback when selected friends change
   */
  onSelectedFriendsChange: (friendIds: string[]) => void;

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;

  /**
   * Custom label for the component
   */
  label?: string;

  /**
   * Custom placeholder for search input
   */
  placeholder?: string;
}

/**
 * FriendTagger component for selecting and tagging friends in quest submissions
 *
 * Features:
 * - Searches through user's friends
 * - Displays selected friends as removable chips
 * - Handles loading and empty states
 * - Seamlessly integrates with quest submission form
 */
export default function FriendTagger({
  accessToken,
  selectedFriendIds,
  onSelectedFriendsChange,
  disabled = false,
  label = "Tag friends",
  placeholder = "Search and add friends",
}: FriendTaggerProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);

  // Load friends on mount
  useEffect(() => {
    const loadFriends = async () => {
      setIsLoading(true);
      try {
        const friendsList = await fetchFriendsList(accessToken);
        setFriends(friendsList);
        setFilteredFriends(friendsList);
      } catch (error) {
        console.error("Error loading friends:", error);
        setFriends([]);
        setFilteredFriends([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, [accessToken]);

  // Update filtered friends when search query changes
  useEffect(() => {
    setFilteredFriends(searchFriends(friends, searchQuery));
  }, [searchQuery, friends]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectFriend = (friendId: string) => {
    if (!selectedFriendIds.includes(friendId)) {
      onSelectedFriendsChange([...selectedFriendIds, friendId]);
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleRemoveFriend = (friendId: string) => {
    onSelectedFriendsChange(selectedFriendIds.filter((id) => id !== friendId));
  };

  const handleInputFocus = () => {
    if (!disabled && !isLoading && friends.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
    }, 120);
  };

  // Get selected friend objects for display
  const selectedFriends = friends.filter((f) => selectedFriendIds.includes(f.publicId));

  // Friends available for selection (not already selected)
  const availableFriends = filteredFriends.filter(
    (f) => !selectedFriendIds.includes(f.publicId)
  );

  return (
    <Stack gap="md">
      {/* Label */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
        <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
          Search for friends to tag them in your submission
        </p>

        {/* Search Input */}
        <div className="relative">
          <TextInput
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled || isLoading || friends.length === 0}
            rightSection={isLoading && <Loader size={16} />}
            className="mb-4"
          />

          {/* Dropdown with available friends */}
          {isDropdownOpen && !disabled && !isLoading && friends.length > 0 && (
            <div className="absolute z-10 w-full mt-1 rounded-lg border border-white/10 bg-[#171717] shadow-lg max-h-64 overflow-y-auto">
              {availableFriends.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {availableFriends.map((friend) => (
                    <button
                      key={friend.publicId}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectFriend(friend.publicId)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 transition text-sm text-[var(--color-text)] flex items-center justify-between"
                    >
                      <span>{friend.username}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                  No matching friends found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Friends as Chips */}
      {selectedFriends.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium text-[var(--color-text-muted)]">
            {selectedFriends.length} {selectedFriends.length === 1 ? "friend" : "friends"} tagged
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map((friend) => (
              <div
                key={friend.publicId}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/20 px-3 py-2 text-sm text-[var(--color-primary)]"
              >
                <span>{friend.username}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFriend(friend.publicId)}
                  className="ml-1 inline-flex items-center justify-center opacity-70 hover:opacity-100 transition"
                  aria-label={`Remove ${friend.username}`}
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && friends.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 bg-black/20 p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            You don&apos;t have any friends yet. Add some friends to tag them in your submissions!
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader size={20} />
          <span className="ml-2 text-sm text-[var(--color-text-muted)]">Loading friends...</span>
        </div>
      )}
    </Stack>
  );
}
