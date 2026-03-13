export interface StoredRequest {
    id: string;
    url: string;
    type: string;
    data?: string;
    time: number;
    completed: boolean;
    response?: string;
    header: string;
}