import { 
  IApiResponse, 
  IItem,
  CreateItemDto,
  ItemResponseDto 
} from '@nx-mono-repo-deployment-test/shared/src';

/**
 * Request DTO for creating an item
 * Matches CreateItemDto structure from backend
 */
export type CreateItemRequest = Pick<CreateItemDto, 'name' | 'description'>;

/**
 * Response DTO for item list
 */
export type ItemListResponse = IApiResponse<ItemResponseDto[]>;

/**
 * Response DTO for single item
 */
export type ItemResponse = IApiResponse<ItemResponseDto>;

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch all items from the API
 * @returns Array of items
 */
export const fetchItems = async (): Promise<IItem[]> => {
  const response = await fetch(`${apiUrl}/api/items`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }
  
  const data: ItemListResponse = await response.json();
  return data.data || [];
};

/**
 * Create a new item via the API
 * @param name - Item name
 * @param description - Item description (optional)
 * @returns API response with created item
 */
export const createItem = async (
  name: string, 
  description?: string
): Promise<ItemResponse> => {
  const requestBody: CreateItemRequest = { name, description };
  
  const response = await fetch(`${apiUrl}/api/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to create item: ${response.statusText}`);
  }

  return await response.json();
};

