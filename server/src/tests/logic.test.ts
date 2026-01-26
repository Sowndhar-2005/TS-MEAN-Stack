import mongoose from 'mongoose';
import { detectUserType, calculateOrderTotal, isUserInSharedCart } from '../utils/logicHelpers';

describe('Logic Helpers Audit', () => {
    describe('detectUserType', () => {
        it('should detect hosteller from reg number with H (uppercase)', () => {
            expect(detectUserType('user@gmail.com', '123H456')).toBe('hosteller');
        });

        it('should detect hosteller from reg number with h (lowercase)', () => {
            expect(detectUserType('user@gmail.com', '123h456')).toBe('hosteller');
        });

        it('should detect hosteller from email with hostel', () => {
            expect(detectUserType('user@hostel.college.edu', '123456')).toBe('hosteller');
        });

        it('should detect dayscholar otherwise', () => {
            expect(detectUserType('user@gmail.com', '123456')).toBe('dayscholar');
        });
    });

    describe('calculateOrderTotal', () => {
        it('should calculate 5% tax correctly for integer', () => {
            const result = calculateOrderTotal(100);
            expect(result.subtotal).toBe(100);
            expect(result.tax).toBe(5);
            expect(result.totalAmount).toBe(105);
        });

        it('should handle floating point inputs and rounding', () => {
            // 10.50 * 0.05 = 0.525 -> rounds to 0.53 (half up) or 0.52?
            // toFixed(2) rounds to nearest, ties to even? No, standard JS toFixed rounds to nearest, ties away from zero usually (wait, let's verify)
            // 0.525.toFixed(2) is '0.53' in Chrome/Node usually.
            const result = calculateOrderTotal(10.50);
            expect(result.subtotal).toBe(10.5);
            expect(result.tax).toBe(0.53); // 10.5 * 0.05 = 0.525 -> 0.53
            expect(result.totalAmount).toBe(11.03); // 10.5 + 0.53 = 11.03
        });

        it('should avoid classic floating point errors', () => {
             // 0.1 + 0.2 = 0.30000000000000004
             // calculateOrderTotal(0.1 + 0.2) -> 0.3
             const result = calculateOrderTotal(0.1 + 0.2);
             expect(result.subtotal).toBe(0.3);
             expect(result.tax).toBe(0.02); // 0.3 * 0.05 = 0.015 -> 0.02
             expect(result.totalAmount).toBe(0.32);
        });
    });

    describe('isUserInSharedCart', () => {
        it('should return true if ObjectId is in array', () => {
            const id1 = new mongoose.Types.ObjectId();
            const id2 = new mongoose.Types.ObjectId();
            const list = [id1, id2];

            // Create a new objectId instance with same value as id1
            const id1Copy = new mongoose.Types.ObjectId(id1.toString());

            expect(isUserInSharedCart(list, id1Copy)).toBe(true);
        });

        it('should return false if ObjectId is not in array', () => {
            const id1 = new mongoose.Types.ObjectId();
            const id2 = new mongoose.Types.ObjectId();
            const list = [id1];

            expect(isUserInSharedCart(list, id2)).toBe(false);
        });

        it('should handle string userIds', () => {
            const id1 = new mongoose.Types.ObjectId();
            const list = [id1];

            expect(isUserInSharedCart(list, id1.toString())).toBe(true);
        });
    });
});
