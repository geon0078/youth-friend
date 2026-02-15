# AGENTS.md - Youth Friend (청년친구)

React Native/Expo mobile app for Korean youth government benefits.

## Quick Reference

```bash
cd app

# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Testing
npm test               # Run all tests
npm test -- --watch    # Watch mode
npm test -- path/to/file.test.ts           # Single test file
npm test -- --testNamePattern="test name"  # Single test by name
npm test -- --coverage                     # With coverage

# Linting
npm run lint           # ESLint via expo lint
```

## Project Structure

```
app/
├── app/                    # Expo Router (file-based routing)
│   ├── (tabs)/            # Tab navigation group
│   ├── (auth)/            # Auth flow group
│   └── index.tsx          # Root entry
├── components/            # React components
│   ├── design-system/     # Design system components (Card, Badge, Button)
│   └── benefits/          # Feature components
├── design-system/         # Design tokens (colors, typography, spacing)
├── hooks/                 # Custom React hooks
├── services/              # Business logic (object-based, not classes)
│   ├── api/               # API clients
│   ├── auth/              # Authentication
│   ├── storage/           # Storage services
│   └── notifications/     # Push notifications
├── stores/                # Zustand state management
├── types/                 # TypeScript types
│   ├── models/            # Domain models
│   └── api/               # API types
├── utils/                 # Utility functions
└── __tests__/             # Test files (mirrors src structure)
```

## Code Style

### Imports

```typescript
// 1. React/React Native
import { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';

// 2. External libraries
import { create } from 'zustand';

// 3. Internal with @ alias (ALWAYS use @/ not relative)
import { Palette, Spacing } from '@/design-system';
import { useUserStore } from '@/stores/user-store';
import { authService } from '@/services/auth';

// 4. Types (use `type` keyword)
import type { Benefit, UserProfile } from '@/types';
```

### Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Components | PascalCase | `Card`, `PrimaryButton` |
| Hooks | camelCase, `use` prefix | `useDebounce`, `useUserStore` |
| Services | camelCase object | `authService`, `storageService` |
| Stores | camelCase, `Store` suffix | `useUserStore`, `useFilterStore` |
| Utils | camelCase | `getCategoryLabel`, `hashPin` |
| Types/Interfaces | PascalCase | `UserProfile`, `BenefitStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_PIN_ATTEMPTS`, `LOCKOUT_DURATION_MS` |
| Files (components) | PascalCase.tsx | `Card.tsx`, `ThemedText.tsx` |
| Files (hooks) | use-kebab.ts | `use-debounce.ts` |
| Files (others) | kebab-case.ts | `auth-service.ts`, `user-store.ts` |

### TypeScript

- **Strict mode enabled** - no `any`, `@ts-ignore`, or type assertions to bypass errors
- Use `type` for type-only exports: `export type { Benefit }`
- Use generics for reusable types: `ApiResponse<T>`
- Use discriminated unions for variants: `type Status = 'active' | 'ended'`
- JSDoc comments for public APIs with Korean descriptions

```typescript
/**
 * Debounce 훅
 * 값이 변경된 후 지정된 시간이 지나야 값을 반환합니다.
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms)
 */
export function useDebounce<T>(value: T, delay: number): T { ... }
```

### Components

```typescript
// Functional components with explicit props typing
export function Card({ variant = 'surface', padding = 'lg', style, children }: CardProps) {
  return <View style={[styles.base, style]}>{children}</View>;
}

// Props with discriminated unions
type CardProps = PropsWithChildren<{
  variant?: 'surface' | 'elevated' | 'outlined';
  style?: ViewStyle;
  padding?: keyof typeof Spacing | number;
}>;

// StyleSheet at bottom of file
const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    backgroundColor: Palette.surface,
  },
});
```

### Services (Object Pattern - NOT Classes)

```typescript
// ✅ CORRECT: Object-based service
export const authService = {
  async isPinSet(): Promise<boolean> {
    const pin = await secureStorage.getItem(SecureStorageKeys.PIN_CODE);
    return pin !== null;
  },

  async setPin(pin: string): Promise<boolean> {
    try {
      const hashed = await hashPin(pin);
      await secureStorage.setItem(SecureStorageKeys.PIN_CODE, hashed);
      return true;
    } catch {
      return false;
    }
  },
};

// ❌ WRONG: Class-based service
export class AuthService { ... }
```

### Zustand Stores

```typescript
interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
}

interface UserActions {
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      isOnboarded: false,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null, isOnboarded: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### Design System Usage

```typescript
import { Palette, Spacing, Radius, Typography } from '@/design-system';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,           // Use tokens, not magic numbers
    backgroundColor: Palette.background,
    borderRadius: Radius.lg,
  },
  title: {
    ...Typography.headline,        // Spread typography presets
    color: Palette.textPrimary,
  },
});
```

### Error Handling

```typescript
// Async operations with try-catch, return result objects
async function setPin(pin: string): Promise<boolean> {
  try {
    const hashed = await hashPin(pin);
    await secureStorage.setItem(SecureStorageKeys.PIN_CODE, hashed);
    return true;
  } catch {
    return false;  // Graceful failure, no empty catch
  }
}

// For user-facing errors, use Korean messages
return {
  success: false,
  error: 'PIN이 일치하지 않습니다.',
};
```

### Testing

```typescript
// Test file location: __tests__/unit/services/auth/auth-service.test.ts
// Mirrors source: services/auth/auth-service.ts

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isPinSet', () => {
    it('PIN이 설정되어 있으면 true 반환', async () => {
      mockSecureStorage.getItem.mockResolvedValue('hashed_pin');
      
      const result = await authService.isPinSet();
      
      expect(result).toBe(true);
    });
  });
});
```

## Language

- **UI strings**: Korean (한국어)
- **Code comments**: Korean preferred for domain logic
- **Variable names**: English
- **Error messages**: Korean for user-facing, English for logs

## Key Libraries

| Library | Purpose |
|---------|---------|
| expo-router | File-based navigation |
| zustand | State management |
| @tanstack/react-query | Server state & caching |
| react-native-mmkv | Fast local storage |
| expo-secure-store | Sensitive data storage |
| expo-local-authentication | Biometric auth |

## Do Not

- Use `any`, `@ts-ignore`, `@ts-expect-error`
- Use class-based services (use object pattern)
- Use relative imports when `@/` alias works
- Use magic numbers (use design tokens)
- Leave empty catch blocks
- Commit sensitive data (.env, credentials)
