type SpeciesData = {
  name: string;
  origin: string;
  description: string;
  characteristics: {
    physiology: string;
    society: string;
    technology: string;
  };
  flag: {
    colors: Array<{
      name: string;
      hex: string;
    }>;
    path: string;
    meaning: string;
  };
}

export function SpeciesProfile({ data }: { data: SpeciesData }) {
  const isValidSvgPath = (path: string) => {
    try {
      return path?.trim().startsWith('M') && path?.trim().endsWith('Z')
    } catch {
      return false
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg transition-all duration-300">
      {/* Species Name and Origin with loading state */}
      {!data?.name ? (
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-2/3 bg-muted rounded mb-2" />
          <div className="h-4 w-1/3 bg-muted rounded" />
        </div>
      ) : (
        <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {data.name}
          </h2>
          {data.origin && (
            <div className="text-sm text-muted-foreground mt-1">
              🌌 {data.origin}
            </div>
          )}
        </div>
      )}

      {/* Flag Display */}
      <div className="mb-6">
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
          {!data?.flag ? (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          ) : (
            <>
              {/* Background with flag colors */}
              <div 
                className="absolute inset-0 transition-all duration-500"
                style={{
                  background: data.flag.colors?.length > 0
                    ? `linear-gradient(135deg, ${data.flag.colors.map(c => c.hex || '#808080').join(', ')})`
                    : 'linear-gradient(135deg, #808080, #a0a0a0)', // Fallback gradient
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' // Subtle inner glow
                }}
              />
              
              {/* SVG Path overlay - only show if valid */}
              {data.flag.path && isValidSvgPath(data.flag.path) && (
                <svg 
                  viewBox="0 0 100 100" 
                  className="absolute inset-0 w-full h-full transition-opacity duration-500"
                  style={{ mixBlendMode: 'overlay' }}
                >
                  <path
                    d={data.flag.path}
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    className="animate-[draw_2s_ease-out_forwards]"
                    style={{
                      strokeDasharray: 1000,
                      strokeDashoffset: 1000,
                      filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' // Add shadow to path
                    }}
                  />
                </svg>
              )}
            </>
          )}
        </div>
        
        {/* Flag colors legend */}
        {data?.flag?.colors?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.flag.colors.map((color, i) => (
              <div 
                key={i} 
                className="flex items-center gap-1 animate-[fadeIn_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div 
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: color.hex || '#808080',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' // Subtle glow
                  }}
                />
                <span className="text-sm text-foreground/80">
                  {color.name || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Flag meaning */}
        {data?.flag?.meaning && (
          <p className="mt-2 text-sm text-foreground/70 italic animate-[fadeIn_0.5s_ease-out_forwards]">
            {data.flag.meaning}
          </p>
        )}
      </div>

      {/* Description */}
      {!data?.description ? (
        <div className="mb-6 animate-pulse">
          <div className="h-4 bg-muted rounded mb-2 w-full" />
          <div className="h-4 bg-muted rounded mb-2 w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      ) : (
        <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-foreground/90">
            {data.description}
          </p>
        </div>
      )}

      {/* Characteristics */}
      <div className="space-y-4">
        {!data?.characteristics ? (
          <>
            <div className="p-4 rounded-lg bg-muted animate-pulse">
              <div className="h-5 w-24 bg-muted-foreground/20 rounded mb-2" />
              <div className="h-4 w-full bg-muted-foreground/20 rounded" />
            </div>
            <div className="p-4 rounded-lg bg-muted animate-pulse">
              <div className="h-5 w-24 bg-muted-foreground/20 rounded mb-2" />
              <div className="h-4 w-full bg-muted-foreground/20 rounded" />
            </div>
            <div className="p-4 rounded-lg bg-muted animate-pulse">
              <div className="h-5 w-24 bg-muted-foreground/20 rounded mb-2" />
              <div className="h-4 w-full bg-muted-foreground/20 rounded" />
            </div>
          </>
        ) : (
          <>
            {data.characteristics.physiology && (
              <div 
                className="p-4 rounded-lg bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 animate-[fadeIn_0.5s_ease-out]"
              >
                <h3 className="font-semibold mb-2 text-foreground">Physiology</h3>
                <p className="text-sm text-foreground/80">
                  {data.characteristics.physiology}
                </p>
              </div>
            )}
            {data.characteristics.society && (
              <div 
                className="p-4 rounded-lg bg-purple-500/10 dark:bg-purple-500/5 border border-purple-500/20 animate-[fadeIn_0.5s_ease-out]"
                style={{ animationDelay: '0.2s' }}
              >
                <h3 className="font-semibold mb-2 text-foreground">Society</h3>
                <p className="text-sm text-foreground/80">
                  {data.characteristics.society}
                </p>
              </div>
            )}
            {data.characteristics.technology && (
              <div 
                className="p-4 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 animate-[fadeIn_0.5s_ease-out]"
                style={{ animationDelay: '0.4s' }}
              >
                <h3 className="font-semibold mb-2 text-foreground">Technology</h3>
                <p className="text-sm text-foreground/80">
                  {data.characteristics.technology}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 