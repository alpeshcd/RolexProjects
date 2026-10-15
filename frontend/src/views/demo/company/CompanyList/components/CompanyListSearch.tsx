import { forwardRef, useState, useEffect } from "react";
import DebouceInput from "@/components/shared/DebouceInput";
import { TbSearch } from "react-icons/tb";
import AxiosBase from "@/services/axios/AxiosBase";

type CustomerListSearchProps = {
  onInputChange: (value: string) => void;
  setUsers: (users: any[]) => void;
  setNextPage: (nextPage: string | null) => void;
  setPrevPage: (prevPage: string | null) => void;
  setLoading: (loading: boolean) => void;
};

const CustomerListSearch = forwardRef<
  HTMLInputElement,
  CustomerListSearchProps
>((props, ref) => {
  const { onInputChange, setUsers, setNextPage, setPrevPage, setLoading } =
    props;
  const [searchQuery, setSearchQuery] = useState("");

  // Function to fetch transaction data based on search
  const searchTransactions = async (search: string) => {
    setLoading(true);
    try {
      const response = await AxiosBase.get(`api/company/`, {
        params: { search },
      });
      setUsers(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
    } catch (error) {
      console.error("Error fetching transactions with search query:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTransactions(searchQuery);
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchQuery]);

  return (
    <DebouceInput
      ref={ref}
      placeholder="Quick search..."
      suffix={<TbSearch className="text-lg" />}
      onChange={(e) => {
        const value = e.target.value;
        setSearchQuery(value);
        onInputChange(value);
      }}
    />
  );
});

CustomerListSearch.displayName = "CustomerListSearch";

export default CustomerListSearch;
