import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { YStack, Input, Button, Text } from 'tamagui';
import Colors from '@/constants/Colors';
import { LogIn } from '@tamagui/lucide-icons';

interface AuthFormProps {
    mode: 'login' | 'register';
    onSubmit: (data: AuthFormData) => void;
}

export interface AuthFormData {
    username?: string | null;
    email: string;
    password: string;
    repeatPassword?: string | null;
}

const schema = (mode: 'login' | 'register') =>
    yup.object().shape({
        username: mode === 'register' ? yup.string().required('Username is required') : yup.string().notRequired(),
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        repeatPassword:
            mode === 'register'
                ? yup
                      .string()
                      .oneOf([yup.ref('password')], 'Passwords must match')
                      .required('Repeat password is required')
                : yup.string().notRequired(),
    });

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormData>({
        resolver: yupResolver(schema(mode)),
    });

    return (
        <YStack paddingHorizontal={'$6'} gap="$3">
            {mode === 'register' && (
                <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input placeholder="Username" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />
                    )}
                />
            )}
            {errors.username && <Text color="red">{errors.username.message}</Text>}

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        placeholder="Email"
                        keyboardType="email-address"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.email && <Text color="red">{errors.email.message}</Text>}

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        placeholder="Password"
                        secureTextEntry
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.password && <Text color="red">{errors.password.message}</Text>}

            {mode === 'register' && (
                <Controller
                    control={control}
                    name="repeatPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Repeat Password"
                            secureTextEntry
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value ?? ''}
                        />
                    )}
                />
            )}
            {errors.repeatPassword && <Text color="red">{errors.repeatPassword.message}</Text>}

            <Button
                backgroundColor={Colors.secondary}
                icon={<LogIn size={'$2'} />}
                fontWeight={'bold'}
                onPress={handleSubmit(onSubmit)}
            >
                {mode === 'login' ? 'Login' : 'Register'}
            </Button>
        </YStack>
    );
};

export default AuthForm;
