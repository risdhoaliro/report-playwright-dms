import { MailSlurp } from "mailslurp-client";
import { waitTime } from "../General/constants";

/**
 * Helper untuk mengelola email dengan MailSlurp
 * Digunakan untuk pengujian fitur lupa kata sandi
 */
export class EmailHelper {
    private mailslurp: MailSlurp;
    
    constructor(apiKey: string) {
        this.mailslurp = new MailSlurp({ apiKey });
    }
    
    /**
     * Membuat inbox email baru
     * @returns Inbox object yang berisi emailAddress dan id
     */
    async createInbox() {
        console.log('[MailSlurp] Membuat inbox baru...');
        try {
            const inbox = await this.mailslurp.createInbox();
            console.log(`[MailSlurp] Inbox berhasil dibuat: ${inbox.emailAddress}`);
            return inbox;
        } catch (error) {
            console.error('[MailSlurp] Gagal membuat inbox:', error);
            throw error;
        }
    }
    
    /**
     * Menunggu email masuk dan mengambilnya
     * @param inboxId ID inbox yang digunakan
     * @param timeout Waktu tunggu dalam ms
     * @returns Email object
     */
    async waitForLatestEmail(inboxId: string, timeout: number = waitTime.LONG) {
        console.log(`[MailSlurp] Menunggu email masuk di inbox ID: ${inboxId}`);
        try {
            // Panggil metode waitForLatestEmail dari mailslurp dengan objek options yang benar
            const email = await this.mailslurp.waitController.waitForLatestEmail({
                inboxId: inboxId,
                timeout: timeout,
                unreadOnly: true
            });
            console.log(`[MailSlurp] Email diterima: ${email.subject}`);
            return email;
        } catch (error) {
            console.error('[MailSlurp] Gagal mendapatkan email:', error);
            throw error;
        }
    }
    
    /**
     * Ekstrak link reset password dari body email
     * @param emailBody Text body dari email
     * @returns URL reset password
     */
    extractResetPasswordLink(emailBody: string): string | null {
        // Pattern untuk mencari URL yang mengandung kata reset-password atau reset_password
        const linkPattern = /(https?:\/\/[^\s"']+(?:reset[-_]password|forgot[-_]password)[^\s"']*)/i;
        const matches = emailBody.match(linkPattern);
        
        if (matches && matches[1]) {
            console.log(`[MailSlurp] Link reset password ditemukan: ${matches[1]}`);
            return matches[1];
        }
        
        console.warn('[MailSlurp] Link reset password tidak ditemukan dalam email');
        return null;
    }
} 