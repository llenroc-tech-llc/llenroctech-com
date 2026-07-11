export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  budget?: string | null;
  message: string;
}
