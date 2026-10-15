import React, { useState, useEffect, useCallback } from 'react'
import { Controller } from 'react-hook-form'
import AxiosBase from '@/services/axios/AxiosBase'
import { Select } from '@/components/ui'

type PaginatedSelectProps = {
    control: any
    name: string
    label: string
    url: string
    errors: any
    placeholder?: string
    onChange?: (value: any) => void
}

const PaginatedSelect = ({
    control,
    name,
    label,
    url,
    errors,
    placeholder = 'Select...',
    onChange,
}: PaginatedSelectProps) => {
    const [options, setOptions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)

    const fetchData = useCallback(async () => {
        if (loading || !hasMore) return

        setLoading(true)
        try {
            const response = await AxiosBase.get(url, {
                params: { page, per_page: 10 },
            })

            const newOptions = response?.data?.results?.data || []
            if (page === 1) {
                setOptions(newOptions)
            } else {
                setOptions((prevOptions) => [...prevOptions, ...newOptions])
            }

            setHasMore(newOptions.length > 0)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }, [page, url, hasMore])

    const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const bottom =
            //@ts-ignore
            event.target.scrollHeight ===
            //@ts-ignore
            event.target.scrollTop + event.target.clientHeight
        if (bottom && hasMore) {
            setPage((prevPage) => prevPage + 1)
        }
    }

    useEffect(() => {
        fetchData()
    }, [page, fetchData])
    return (
        <div>
            <div className="mb-2 font-semibold">
                <label>{label}</label>
            </div>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div>
                        <Select
                            {...field}
                            inputId={name}
                            isClearable
                            options={options.map((option) => ({
                                label: option.name,
                                value: option.id.toString(),
                            }))}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(selectedOption: any) => {
                                // Pass only the string value to field.onChange
                                field.onChange(selectedOption?.value || null)

                                if (onChange) {
                                    onChange(selectedOption?.value || null)
                                }
                            }}
                            // Find the matching option object for display
                            value={
                                options
                                    .map((option) => ({
                                        label: option.name,
                                        value: option.id.toString(),
                                    }))
                                    .find(
                                        (option) =>
                                            option.value === field.value,
                                    ) || null
                            }
                            placeholder={placeholder}
                            isLoading={loading}
                            //@ts-ignore
                            onMenuScrollToBottom={handleScroll}
                        />
                        {/* Error Message */}
                        {errors[name] && (
                            <div className="error-message text-[#FF6A55] font-semibold">
                                <p>{errors[name]?.message}</p>
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    )
}

export default PaginatedSelect
