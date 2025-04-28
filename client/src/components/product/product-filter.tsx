import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/lib/types";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface ProductFilterProps {
  selectedCategories: number[];
  priceRange: [number, number];
  minRating: number;
  onCategoryChange: (id: number) => void;
  onPriceChange: (range: [number, number]) => void;
  onRatingChange: (rating: number) => void;
  onApplyFilters: () => void;
}

export default function ProductFilter({
  selectedCategories,
  priceRange,
  minRating,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onApplyFilters
}: ProductFilterProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-2">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["categories", "price", "rating"]} className="space-y-4">
          {/* Categories Filter */}
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="py-2 font-poppins font-medium text-sm uppercase tracking-wider text-muted-foreground">
              Categories
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="space-y-2">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category.id}`} 
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => onCategoryChange(category.id)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className="py-2 font-poppins font-medium text-sm uppercase tracking-wider text-muted-foreground">
              Price Range
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="px-2">
                <Slider 
                  min={10}
                  max={200}
                  step={5}
                  value={[localPriceRange[0], localPriceRange[1]]}
                  onValueChange={handlePriceChange}
                  className="mb-4"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">${localPriceRange[0]}</span>
                  <span className="text-xs text-muted-foreground">${localPriceRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating Filter */}
          <AccordionItem value="rating" className="border-none">
            <AccordionTrigger className="py-2 font-poppins font-medium text-sm uppercase tracking-wider text-muted-foreground">
              Rating
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <RadioGroup value={minRating.toString()} onValueChange={(value) => onRatingChange(parseInt(value))}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="r-5" />
                    <Label htmlFor="r-5" className="flex text-amber-400">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="r-4" />
                    <Label htmlFor="r-4" className="flex text-amber-400">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-line"></i>
                      <span className="text-muted-foreground text-sm ml-1">& up</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r-3" />
                    <Label htmlFor="r-3" className="flex text-amber-400">
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-fill"></i>
                      <i className="ri-star-line"></i>
                      <i className="ri-star-line"></i>
                      <span className="text-muted-foreground text-sm ml-1">& up</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="r-all" />
                    <Label htmlFor="r-all" className="text-sm">
                      All ratings
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Apply Filters Button */}
        <Button 
          className="w-full mt-4"
          onClick={() => {
            onPriceChange(localPriceRange);
            onApplyFilters();
          }}
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
