import { unipileFetch } from './client'

export async function sendDirectMessage(
    accountId: string,
    attendeeId: string,
    text: string
): Promise<{ id: string }> {
    return unipileFetch<{ id: string }>(
        `/messaging/accounts/${accountId}/chats`,
        {
            method: 'POST',
            body: JSON.stringify({
                attendee_id: attendeeId,
                text: text,
            }),
        }
    )
}
