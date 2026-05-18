"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { InputBase, Box, IconButton } from "@mui/material";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const listPath = pathname === "/manage" ? "/manage" : "/shop";

  const handleSeachClick = () => {
    if (search.trim()) {
      router.push(
        `${listPath}?search=${encodeURIComponent(search.trim())}`,
      );
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(
        `${listPath}?search=${encodeURIComponent(search.trim())}`,
      );
    }
  };

  const handleClear = () => {
    setSearch("");
    router.push(listPath);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(254, 254, 254, 0.15)",
        borderRadius: "8px",
        px: 1.5,
        mx: 2,
        maxWidth: 400,
      }}
    >
      <SearchIcon
        onClick={handleSeachClick}
        style={{
          color: "rgb(189, 197, 217)",
          fontSize: "20px",
          cursor: search ? "pointer" : "default",
        }}
      />
      <InputBase
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
        sx={{
          ml: 1,
          flex: 1,
          color: "rgb(254, 254, 254)",
          fontSize: "0.9rem",
          "& ::placeholder": { color: "rgb(189, 197, 217)" },
        }}
      />
      {search && (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{ color: "rgb(189, 197, 217)", p: 0.5 }}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
