/**
 * Utility for generating fake test data
 */
export class FakeDataGenerator {
  
  static getRandomEmail(): string {
    const timestamp = new Date().getTime();
    return `test.user${timestamp}@example.com`;
  }
  
  static getRandomUsername(): string {
    const timestamp = new Date().getTime();
    return `testuser_${timestamp}`;
  }
  
  static getRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  static getRandomPhoneNumber(): string {
    let phoneNumber = '+1';
    for (let i = 0; i < 10; i++) {
      phoneNumber += Math.floor(Math.random() * 10);
    }
    return phoneNumber;
  }
  
  static getRandomDate(startYear = 2000, endYear = 2023): Date {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    return new Date(start + Math.random() * (end - start));
  }
  
  static getRandomUser(): any {
    return {
      username: this.getRandomUsername(),
      email: this.getRandomEmail(),
      password: this.getRandomPassword(),
      phoneNumber: this.getRandomPhoneNumber(),
      createdDate: this.getRandomDate()
    };
  }
} 