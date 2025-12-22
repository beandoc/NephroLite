"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Check, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStaffMessages } from "@/hooks/use-staff-messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function MessagesDropdown() {
    const { messages, unreadCount, markAsRead, markAllAsRead } = useStaffMessages();

    // Get only unread messages for dropdown (limit to 5)
    const unreadMessages = messages
        .filter(m => !m.isRead)
        .slice(0, 5);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 min-w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Messages</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Staff Messages</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={markAllAsRead}
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {unreadMessages.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No unread messages</p>
                    </div>
                ) : (
                    <ScrollArea className="h-64">
                        {unreadMessages.map((message) => (
                            <DropdownMenuItem
                                key={message.id}
                                className="flex flex-col items-start p-3 cursor-pointer"
                                onClick={() => markAsRead(message.id)}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className="font-semibold text-sm">{message.senderName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {message.createdAt && formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })}
                                    </span>
                                </div>
                                {message.subject && (
                                    <p className="text-xs font-medium text-primary mb-1">{message.subject}</p>
                                )}
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {message.message}
                                </p>
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/communication" className="w-full text-center cursor-pointer">
                        View all messages
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
