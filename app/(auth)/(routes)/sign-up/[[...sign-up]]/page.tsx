'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { signUp } from '@/auth/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff } from 'lucide-react'

/* ---------------- Schema (Zod v3+) ---------------- */
const SignUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter required')
      .regex(/[a-z]/, 'One lowercase letter required')
      .regex(/\d/, 'One number required')
      .regex(/[@$!%*?#&]/, 'One special character required'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type SignUpForm = z.infer<typeof SignUpSchema>

/* ---------------- Password Strength ---------------- */
const getStrength = (password: string = '') => {
  let score = 0
  if (password.length >= 8) score += 25
  if (/[A-Z]/.test(password)) score += 25
  if (/[0-9]/.test(password)) score += 25
  if (/[@$!%*?#&]/.test(password)) score += 25
  return score
}

const SignUp = (): React.JSX.Element => {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [apiError, setApiError] = useState(false)

  const {
    register,
    handleSubmit,
    control, // ✅ required for useWatch
    formState: { errors, isValid, isSubmitting }
  } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onChange'
  })

  /* ✅ REPLACEMENT for watch() */
  const password = useWatch({
    control,
    name: 'password',
    defaultValue: ''
  })

  const strength = getStrength(password)

  const onSubmit = async (data: SignUpForm) => {
    setMessage('')
    setApiError(false)

    const { error } = await signUp(data.email, data.password)

    if (error) {
      setMessage(error.message)
      setApiError(true)
    } else {
      setMessage('Sign up successful! Check your email to confirm.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338] px-4">
      <Card className="w-full max-w-md bg-[#2b2d31] border-none shadow-xl text-white">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">
            Create an account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Welcome to <span className="text-indigo-400 font-medium">EduConnect</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-400">Email</Label>
              <Input
                {...register('email')}
                placeholder="you@example.com"
                className="bg-[#1e1f22] border-none"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-400">Password</Label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="bg-[#1e1f22] border-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength meter */}
              <Progress value={strength} className="h-2" />
              <p className="text-xs text-gray-500">
                Strength: {strength < 50 ? 'Weak' : strength < 75 ? 'Medium' : 'Strong'}
              </p>

              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-400">
                Confirm Password
              </Label>
              <Input
                {...register('confirmPassword')}
                type="password"
                className="bg-[#1e1f22] border-none"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          {message && (
            <Alert
              className={`mt-4 ${
                apiError
                  ? 'border-red-500 text-red-400'
                  : 'border-green-500 text-green-400'
              } bg-transparent`}
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp
