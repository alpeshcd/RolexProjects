import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { Controller } from 'react-hook-form'
import { Switcher } from '@/components/ui'

const apiSetup = import.meta.env.VITE_APP_API_URL

const OverviewSection = ({
    control,
    errors,
    newCustomer,
}: {
    control: any
    errors: any
    newCustomer: boolean
    setSelectedSubRoles: (roles: string[]) => void
    selectedSubRoles: string[]
    subUser: any

    subrole: any
}) => {
    // Manage the isManually field state

    return (
        <Card>
            <h4 className="mb-6">Overview</h4>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Name Field */}
                <FormItem
                    label="Company Name"
                    invalid={Boolean(errors.company_name)}
                    errorMessage={errors.company_name?.message}
                >
                    <Controller
                        name="company_name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Company Name"
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
                    label="City"
                    invalid={Boolean(errors.city)}
                    errorMessage={errors.city?.message}
                >
                    <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="City"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Address"
                    invalid={Boolean(errors.address)}
                    errorMessage={errors.address?.message}
                >
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Address"
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

                {/* Conditionally Show Webhook URL based on isManually state */}
                <FormItem
                    label="website "
                    invalid={Boolean(errors.website)}
                    errorMessage={errors.website?.message}
                >
                    <Controller
                        name="website"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="Enter website URL"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
        </Card>
    )
}

export default OverviewSection
