import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { Controller } from 'react-hook-form'
import type { FormSectionBaseProps } from './types'
import { PasswordInput } from '@/components/shared'
import { Button, Select } from '@/components/ui'
import AxiosBase from '@/services/axios/AxiosBase'
import PaginatedSelect from '../../PaginatedSelect'

type OverviewSectionProps = FormSectionBaseProps & {
    isEdit: boolean
}
const apiSetup = import.meta.env.VITE_APP_API_URL

const OverviewSection = ({
    control,
    errors,
    setSelectedSubRoles,
}: {
    control: any
    errors: any
    newCustomer: boolean
    setSelectedSubRoles: (roles: string[]) => void
    selectedSubRoles: string[]
    subrole: any
    company?: string
}) => {
    const [role, setRole] = useState<string>('')
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)
    const [subRoles, setSubRoles] = useState<any[]>([])
    const handleRoleChange = (value: string) => {
        setRole(value)

        setSubRoles([])
        setSelectedSubRoles([])
    }

    // Handle new password change

    const allOptions = [
        { value: '1', label: 'Manager' },
        { value: '2', label: 'Admin' },
    ]

    // Define default options based on roleStore
    const [defaultOptions, setDefaultOptions] =
        useState<{ value: string; label: string }[]>(allOptions)

    const fetchStaff = async () => {
        try {
            const response = await AxiosBase.get(
                `${apiSetup}api/company/fetch_all/`,
            )
            console.log(response.data, 'dataa')
            if (response.data && response.data.data) {
                setStaff(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching staff:', error)
        } finally {
            setLoading(false)
        }
    }

    const staffOptions = staff.map((person: any) => ({
        value: person.id,
        label: `${person.name}`,
    }))
    return (
        <Card>
            <h4 className="mb-6">Overview</h4>
            <div className="grid md:grid-cols-2 gap-4">
                <FormItem
                    label="First Name"
                    invalid={Boolean(errors.first_name)}
                    errorMessage={errors.first_name?.message}
                >
                    <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="First Name"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Last Name"
                    invalid={Boolean(errors.last_name)}
                    errorMessage={errors.last_name?.message}
                >
                    <Controller
                        name="last_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Last Name"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Username"
                    invalid={Boolean(errors.username)}
                    errorMessage={errors.username?.message}
                >
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Username"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Email"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                placeholder="New Password"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Phone Number"
                    invalid={Boolean(errors.phone_number)}
                    errorMessage={errors.phone_number?.message}
                >
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                autoComplete="off"
                                placeholder="Phone Number"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {/* Role Selection */}

                <PaginatedSelect
                    control={control}
                    name="role"
                    label="Role"
                    url="/role/" 
                    errors={errors} 
                    placeholder="Search for role..."
                />
            </div>
        </Card>
    )
}

export default OverviewSection
